export const TYPO_CONSTANTS = {
  PAGE_SIZE: 20,
  HIGHLIGHT_DURATION: 3000,
  VALIDATION: {
    ERROR_MESSAGE: '오타 단어와 교정어를 모두 입력해주세요.',
    EMPTY_ERROR: '등록된 항목이 없습니다',
    EMPTY_HINT: '새로운 오타교정 규칙을 추가해보세요',
    SERVER_ERROR_TITLE: '서버 연결에 문제가 있습니다',
    SERVER_ERROR_HINT: 'API 서버가 실행 중인지 확인해주세요.',
    API_VERSION_HINT: '오타교정 API v2.0 구조가 서버에 반영되었는지 확인이 필요합니다.'
  },
  MESSAGES: {
    DELETE_CONFIRM: '정말로 삭제하시겠습니까?',
    DELETE_SUCCESS: '사전 항목이 성공적으로 삭제되었습니다.',
    SYNC_SUCCESS: '오타교정 사전이 실시간으로 반영되었습니다.',
    SERVER_ERROR: '서버에서 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    FETCH_ERROR: '목록 조회 중 오류가 발생했습니다.'
  }
} as const