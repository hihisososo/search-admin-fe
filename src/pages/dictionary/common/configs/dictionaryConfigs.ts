import type { DictionaryConfigs } from '../types/dictionary.types'

export const dictionaryConfigs: DictionaryConfigs = {
  user: {
    name: '사용자',
    apiPath: '/users',
    theme: {
      color: 'purple',
      iconName: 'User'
    },
    fields: ['keyword'],
    validation: {
      keyword: (value) => value.trim() !== ''
    },
    features: {
      realtimeSync: false
    },
    messages: {
      placeholder: {
        keyword: '단어를 입력하세요 (예: "삼성" 또는 "삼성전자 삼성 전자")'
      },
      validationError: {
        keyword: '키워드를 입력해주세요.'
      },
      deleteConfirm: '사용자 단어를 삭제하시겠습니까?',
    }
  },
  
  stopword: {
    name: '불용어',
    apiPath: '/stopwords',
    theme: {
      color: 'orange',
      iconName: 'Ban'
    },
    fields: ['keyword'],
    validation: {
      keyword: (value) => /^[^\s,]+$/.test(value.trim())
    },
    features: {
      realtimeSync: false
    },
    messages: {
      placeholder: {
        keyword: '불용어를 입력하세요 (예: 그)'
      },
      validationError: {
        keyword: '불용어는 단일 단어로 입력해주세요. (콤마나 특수문자 불가)'
      },
      deleteConfirm: '불용어를 삭제하시겠습니까?',
    }
  },
  
  synonym: {
    name: '동의어',
    apiPath: '/synonyms',
    theme: {
      color: 'blue',
      iconName: 'GitBranch'
    },
    fields: ['keyword'],
    validation: {
      keyword: (value) => value.trim() !== ''
    },
    features: {
      realtimeSync: true,
      customRenderer: 'synonym'
    },
    messages: {
      placeholder: {
        keyword: '동의어를 입력하세요 (예: "핸드폰, 휴대폰, 스마트폰" 또는 "lg => LG전자, 엘지")'
      },
      validationError: {
        keyword: '동의어를 입력해주세요.'
      },
      deleteConfirm: '동의어 그룹을 삭제하시겠습니까?',
      applyConfirm: '변경사항을 실시간으로 반영하시겠습니까?',
      applySuccess: '동의어 사전이 실시간으로 반영되었습니다.'
    }
  },
  
  typo: {
    name: '오타교정',
    apiPath: '/typos',
    theme: {
      color: 'green',
      iconName: 'CheckCircle'
    },
    fields: ['keyword', 'correctedWord'],
    validation: {
      keyword: (value) => value.trim() !== '',
      correctedWord: (value) => value.trim() !== ''
    },
    features: {
      realtimeSync: true,
      customRenderer: 'typo'
    },
    messages: {
      placeholder: {
        keyword: '오타를 입력하세요',
        correctedWord: '교정어를 입력하세요'
      },
      validationError: {
        keyword: '오타 단어를 입력해주세요.',
        correctedWord: '교정어를 입력해주세요.'
      },
      deleteConfirm: '오타교정을 삭제하시겠습니까?',
      applyConfirm: '변경사항을 실시간으로 반영하시겠습니까?',
      applySuccess: '오타교정 사전이 실시간으로 반영되었습니다.'
    }
  },

  unit: {
    name: '단위명',
    apiPath: '/units',
    theme: {
      color: 'purple',
      iconName: 'Ruler'
    },
    fields: ['keyword'],
    validation: {
      keyword: (value) => value.trim() !== ''
    },
    features: {
      realtimeSync: false
    },
    messages: {
      placeholder: {
        keyword: '단위명을 입력하세요 (예: "kg", "ml", "개")'
      },
      validationError: {
        keyword: '단위명을 입력해주세요.'
      },
      deleteConfirm: '단위명사전을 삭제하시겠습니까?'
    }
  }
}

export function getDictionaryConfig<K extends keyof DictionaryConfigs>(type: K): DictionaryConfigs[K] {
  return dictionaryConfigs[type]
}