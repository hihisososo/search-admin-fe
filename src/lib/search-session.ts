/**
 * 검색 세션 ID 관리 유틸리티
 * 사용자의 검색 행동을 추적하기 위한 세션 ID 생성 및 관리
 */

const SESSION_KEY = 'search-session-id';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30분

interface SessionData {
  id: string;
  createdAt: number;
  lastActivity: number;
}

/**
 * 새로운 세션 ID 생성
 * 형식: session-{timestamp}-{random}
 */
function generateSessionId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `session-${timestamp}-${random}`;
}

/**
 * 세션 데이터 가져오기
 */
function getSessionData(): SessionData | null {
  try {
    const data = sessionStorage.getItem(SESSION_KEY);
    if (!data) return null;
    
    const session = JSON.parse(data) as SessionData;
    const now = Date.now();
    
    // 세션 만료 확인 (30분)
    if (now - session.lastActivity > SESSION_TIMEOUT) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    
    return session;
  } catch {
    return null;
  }
}

/**
 * 세션 데이터 저장
 */
function saveSessionData(session: SessionData): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/**
 * 현재 세션 ID 가져오기 (없으면 새로 생성)
 */
export function getSearchSessionId(): string {
  let session = getSessionData();
  
  if (!session) {
    // 새 세션 생성
    const now = Date.now();
    session = {
      id: generateSessionId(),
      createdAt: now,
      lastActivity: now
    };
    saveSessionData(session);
  } else {
    // 활동 시간 업데이트
    session.lastActivity = Date.now();
    saveSessionData(session);
  }
  
  return session.id;
}

/**
 * 세션 초기화 (새로운 세션 시작)
 */
export function resetSearchSession(): string {
  const now = Date.now();
  const session: SessionData = {
    id: generateSessionId(),
    createdAt: now,
    lastActivity: now
  };
  saveSessionData(session);
  return session.id;
}

/**
 * 세션 정보 가져오기 (디버깅용)
 */
export function getSearchSessionInfo(): {
  id: string;
  duration: number;
  isActive: boolean;
} | null {
  const session = getSessionData();
  if (!session) return null;
  
  const now = Date.now();
  return {
    id: session.id,
    duration: now - session.createdAt,
    isActive: now - session.lastActivity <= SESSION_TIMEOUT
  };
}