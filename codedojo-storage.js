window.CodeDojoStorage = (() => {
  const KEY = "codedojo.v1";
  const UKEY = "codedojo_user";
  const mem = {};
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return mem[k] ?? null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { mem[k] = v; } },
    del(k) { try { localStorage.removeItem(k); } catch { delete mem[k]; } }
  };
  const demoSession = {
    get(k) { try { return sessionStorage.getItem(k); } catch { return mem[k] ?? null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch { mem[k] = v; } },
    del(k) { try { sessionStorage.removeItem(k); } catch { delete mem[k]; } }
  };
  const defaults = () => ({ name: "You", teamId: null, teams: window.CodeDojoData.seedTeams(), solved: {}, activity: {}, submissions: [], drafts: {}, score: 0, simulate: true });
  const parseStored = (value, fallback) => {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" ? parsed : fallback;
    } catch {
      return fallback;
    }
  };
  const base = defaults();
  const parsedState = parseStored(store.get(KEY), base);
  let state = {
    ...base,
    ...parsedState,
    name: typeof parsedState.name === "string" && parsedState.name.trim() ? parsedState.name.trim().slice(0, 20) : "You",
    teamId: typeof parsedState.teamId === "string" ? parsedState.teamId : null,
    simulate: typeof parsedState.simulate === "boolean" ? parsedState.simulate : true,
    solved: parsedState.solved && typeof parsedState.solved === "object" ? parsedState.solved : {},
    activity: parsedState.activity && typeof parsedState.activity === "object" ? parsedState.activity : {},
    submissions: Array.isArray(parsedState.submissions) ? parsedState.submissions : [],
    drafts: parsedState.drafts && typeof parsedState.drafts === "object" ? parsedState.drafts : {},
    teams: Array.isArray(parsedState.teams) ? parsedState.teams : base.teams,
    score: Number.isFinite(parsedState.score) ? Math.max(0, parsedState.score) : 0
  };
  const save = () => store.set(KEY, JSON.stringify(state));
  const getUser = () => {
    const user = parseStored(demoSession.get(UKEY), null);
    if (!user || user.demo !== true || typeof user.name !== "string") return null;
    const name = user.name.trim();
    return name.length >= 2 && name.length <= 20 ? { ...user, name } : null;
  };
  const setUser = u => demoSession.set(UKEY, JSON.stringify(u));
  const clearUser = () => demoSession.del(UKEY);
  return Object.freeze({ KEY, UKEY, store, demoSession, state, save, getUser, setUser, clearUser });
})();
