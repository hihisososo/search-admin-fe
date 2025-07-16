export interface IndexItem {
    name: string
    description?: string
}

export interface SearchResult {
    _index: string
    _id: string
    _score: number
    _source: Record<string, any>
}

export interface ElasticsearchResponse {
    took: number
    timed_out: boolean
    _shards: {
        total: number
        successful: number
        skipped: number
        failed: number
    }
    hits: {
        total: {
            value: number
            relation: string
        }
        max_score: number
        hits: SearchResult[]
    }
    aggregations?: Record<string, any>
}

export interface SearchResponse {
    indexName: string
    took: number
    searchResult: ElasticsearchResponse
}

export interface SavedQuery {
    id: number
    name: string
    description?: string
    queryDsl: string
    indexName: string
    createdAt: string
    updatedAt: string
}

export interface PageResponse<T> {
    content: T[]
    page: number
    size: number
    totalElements: number
    totalPages: number
} 