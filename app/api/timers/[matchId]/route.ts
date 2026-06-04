import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DB_DIR = path.join(process.cwd(), "server-db");
const TIMERS_FILE = path.join(DB_DIR, "timers.json");

interface MatchTimer {
  matchId: string;
  status: 'Upcoming' | 'FirstHalf' | 'HalfTime' | 'SecondHalf' | 'Finished';
  isPaused: boolean;
  matchStartTime?: number;
  firstHalfEndTime?: number;
  halfTimeStartTime?: number;
  secondHalfStartTime?: number;
  secondHalfEndTime?: number;
  firstHalfAddedTime: number;
  secondHalfAddedTime: number;
  lastResumedAt?: number;
  accumulatedElapsedMs: number;
}

function getTimers(): Record<string, MatchTimer> {
  try {
    if (fs.existsSync(TIMERS_FILE)) {
      return JSON.parse(fs.readFileSync(TIMERS_FILE, "utf8"));
    }
  } catch (err) {
    console.error("Error reading timers.json", err);
  }
  return {};
}

function saveTimers(timers: Record<string, MatchTimer>) {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(TIMERS_FILE, JSON.stringify(timers, null, 2), "utf8");
  } catch (err) {
    console.error("Error saving timers.json", err);
  }
}

function computeLiveTimerValue(timer: MatchTimer, T: number = Date.now()): {
  liveMinuteStr: string;
  isPaused: boolean;
  status: string;
} {
  const firstHalfTotalMinutes = 30 + (timer.firstHalfAddedTime || 0);
  const secondHalfTotalMinutes = 30 + (timer.secondHalfAddedTime || 0);

  if (timer.status === 'Upcoming') {
    return {
      liveMinuteStr: "00:00",
      isPaused: true,
      status: 'Upcoming'
    };
  }

  if (timer.status === 'FirstHalf') {
    let elapsedMs = timer.accumulatedElapsedMs;
    if (!timer.isPaused && timer.lastResumedAt) {
      elapsedMs += (T - timer.lastResumedAt);
    }
    const maxMs = firstHalfTotalMinutes * 60 * 1000;
    if (elapsedMs >= maxMs) {
      return {
        liveMinuteStr: "HT 10:00",
        isPaused: true,
        status: 'HalfTime'
      };
    }
    const totalSec = Math.floor(elapsedMs / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    const mStr = String(m).padStart(2, '0');
    const sStr = String(s).padStart(2, '0');
    return {
      liveMinuteStr: `${mStr}:${sStr}`,
      isPaused: timer.isPaused,
      status: 'FirstHalf'
    };
  }

  if (timer.status === 'HalfTime') {
    if (!timer.halfTimeStartTime) {
      return {
        liveMinuteStr: "HT 10:00",
        isPaused: true,
        status: 'HalfTime'
      };
    }
    const elapsedMs = T - timer.halfTimeStartTime;
    const breakDurationMs = 10 * 60 * 1000;
    const remainingMs = Math.max(0, breakDurationMs - elapsedMs);
    const totalSec = Math.floor(remainingMs / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    const mStr = String(m).padStart(2, '0');
    const sStr = String(s).padStart(2, '0');
    return {
      liveMinuteStr: `HT ${mStr}:${sStr}`,
      isPaused: false,
      status: 'HalfTime'
    };
  }

  if (timer.status === 'SecondHalf') {
    let elapsedMs = timer.accumulatedElapsedMs;
    if (!timer.isPaused && timer.lastResumedAt) {
      elapsedMs += (T - timer.lastResumedAt);
    }
    const maxMs = secondHalfTotalMinutes * 60 * 1000;
    if (elapsedMs >= maxMs) {
      return {
        liveMinuteStr: "FT",
        isPaused: true,
        status: 'Finished'
      };
    }
    const totalSecInSecondHalf = Math.floor(elapsedMs / 1000);
    const mInSecondHalf = Math.floor(totalSecInSecondHalf / 60);
    const sInSecondHalf = totalSecInSecondHalf % 60;

    const matchMinNum = 30 + mInSecondHalf;
    const mStr = String(matchMinNum).padStart(2, '0');
    const sStr = String(sInSecondHalf).padStart(2, '0');
    return {
      liveMinuteStr: `${mStr}:${sStr}`,
      isPaused: timer.isPaused,
      status: 'SecondHalf'
    };
  }

  if (timer.status === 'Finished') {
    return {
      liveMinuteStr: "FT",
      isPaused: true,
      status: 'Finished'
    };
  }

  return {
    liveMinuteStr: "FT",
    isPaused: true,
    status: 'Finished'
  };
}

function getOrUpdateLiveTimer(matchId: string, T: number = Date.now()): MatchTimer {
  const timers = getTimers();
  let timer = timers[matchId];
  if (!timer) {
    timer = {
      matchId,
      status: 'Upcoming',
      isPaused: true,
      firstHalfAddedTime: 0,
      secondHalfAddedTime: 0,
      accumulatedElapsedMs: 0
    };
    timers[matchId] = timer;
    saveTimers(timers);
    return timer;
  }

  let changed = false;

  if (timer.status === 'FirstHalf') {
    let elapsedMs = timer.accumulatedElapsedMs;
    if (!timer.isPaused && timer.lastResumedAt) {
      elapsedMs += (T - timer.lastResumedAt);
    }
    const maxMs = (30 + (timer.firstHalfAddedTime || 0)) * 60 * 1000;
    if (elapsedMs >= maxMs) {
      timer.status = 'HalfTime';
      timer.isPaused = true;
      const transitionTime = timer.lastResumedAt ? timer.lastResumedAt + (maxMs - timer.accumulatedElapsedMs) : T;
      timer.firstHalfEndTime = transitionTime;
      timer.halfTimeStartTime = transitionTime;
      timer.accumulatedElapsedMs = 0;
      changed = true;
    }
  } else if (timer.status === 'HalfTime') {
    const elapsedMs = T - (timer.halfTimeStartTime || T);
    const breakDurationMs = 10 * 60 * 1000;
    if (elapsedMs >= breakDurationMs && !timer.isPaused) {
      // countdown completed
    }
  } else if (timer.status === 'SecondHalf') {
    let elapsedMs = timer.accumulatedElapsedMs;
    if (!timer.isPaused && timer.lastResumedAt) {
      elapsedMs += (T - timer.lastResumedAt);
    }
    const maxMs = (30 + (timer.secondHalfAddedTime || 0)) * 60 * 1000;
    if (elapsedMs >= maxMs) {
      timer.status = 'Finished';
      timer.isPaused = true;
      const transitionTime = timer.lastResumedAt ? timer.lastResumedAt + (maxMs - timer.accumulatedElapsedMs) : T;
      timer.secondHalfEndTime = transitionTime;
      changed = true;
    }
  }

  if (changed) {
    timers[matchId] = timer;
    saveTimers(timers);
  }

  return timer;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { matchId: string } }
) {
  try {
    const { matchId } = params;
    const T = Date.now();
    const verifiedTimer = getOrUpdateLiveTimer(matchId, T);
    const computed = computeLiveTimerValue(verifiedTimer, T);

    return NextResponse.json({
      success: true,
      timer: {
        liveMinute: computed.liveMinuteStr,
        isPaused: computed.isPaused,
        status: computed.status,
        timerData: verifiedTimer
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
