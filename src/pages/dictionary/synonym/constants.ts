export const SYNONYM_CONSTANTS = {
  PAGE_SIZE: 20,
  HIGHLIGHT_DURATION: 3000,
  VALIDATION: {
    ERROR_MESSAGE: '올바른 형식으로 입력해주세요.\n단방향: 휴대폰 => 핸드폰,모바일,스마트폰\n양방향: 휴대폰,핸드폰,모바일,스마트폰',
    EMPTY_ERROR: '등록된 항목이 없습니다',
    EMPTY_HINT: '새로운 동의어 규칙을 추가해보세요'
  },
  MESSAGES: {
    DELETE_CONFIRM: '정말로 삭제하시겠습니까?',
    DELETE_SUCCESS: '사전 항목이 성공적으로 삭제되었습니다.',
    SYNC_SUCCESS: '동의어사전이 실시간으로 반영되었습니다.',
    SERVER_ERROR: '서버에서 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    FETCH_ERROR: '목록 조회 중 오류가 발생했습니다.'
  }
} as const