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
      // Countdown complete
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

export async function POST(
  req: NextRequest,
  { params }: { params: { matchId: string } }
) {
  try {
    const { matchId } = params;
    const body = await req.json();
    const { action, period, addedMinutes, value } = body;

    const T = Date.now();
    const timers = getTimers();
    let timer = getOrUpdateLiveTimer(matchId, T);

    switch (action) {
      case 'START':
        timer.status = 'FirstHalf';
        timer.isPaused = false;
        timer.matchStartTime = T;
        timer.lastResumedAt = T;
        timer.accumulatedElapsedMs = 0;
        break;

      case 'PAUSE':
        if (!timer.isPaused) {
          timer.isPaused = true;
          if (timer.lastResumedAt) {
            timer.accumulatedElapsedMs += (T - timer.lastResumedAt);
          }
        }
        break;

      case 'RESUME':
        if (timer.isPaused) {
          if (timer.status === 'HalfTime') {
            timer.status = 'SecondHalf';
            timer.secondHalfStartTime = T;
            timer.lastResumedAt = T;
            timer.accumulatedElapsedMs = 0;
            timer.isPaused = false;
          } else {
            timer.isPaused = false;
            timer.lastResumedAt = T;
          }
        }
        break;

      case 'ADD_INJURY_TIME':
        if (period === 'first') {
          timer.firstHalfAddedTime = Number(addedMinutes) || 0;
        } else if (period === 'second') {
          timer.secondHalfAddedTime = Number(addedMinutes) || 0;
        }
        break;

      case 'END':
        if (timer.status === 'FirstHalf') {
          timer.firstHalfEndTime = T;
        } else {
          timer.secondHalfEndTime = T;
        }
        timer.status = 'Finished';
        timer.isPaused = true;
        break;

      case 'SET_MINUTE':
        const minNum = parseFloat(value) || 0;
        if (timer.status === 'FirstHalf') {
          timer.accumulatedElapsedMs = minNum * 60 * 1000;
          timer.lastResumedAt = T;
        } else if (timer.status === 'SecondHalf') {
          timer.accumulatedElapsedMs = Math.max(0, minNum - 30) * 60 * 1000;
          timer.lastResumedAt = T;
        }
        break;

      default:
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    }

    timers[matchId] = timer;
    saveTimers(timers);

    return NextResponse.json({ success: true, timer });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
