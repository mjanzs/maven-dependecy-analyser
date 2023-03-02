export class AnalyserResult {

    static empty(title, key) {
        return new class EmptyResult extends AnalyserResult {
            values() {
                return {}
            }

            headers() {
                return {
                    id: key, title: title
                }
            }
        }
    }

    values() {
        throw new Error()
    }

    headers() {
        throw new Error()
    }
}

export class MultiAnalyserResult extends AnalyserResult {
    results

    constructor(results) {
        super()
        this.results = results
    }

    values() {
        return this.results.reduce((acc, result) => {
            return {
                ...acc,
                ...result.values()
            }
        }, {})
    }

    headers() {
        return this.results.map((r) => {
            return r.headers()
        })
    }

    *[Symbol.iterator]() {
        for (let r of this.results) {
            yield r;
        }
    }

}

export class SingleAnalyserResult extends AnalyserResult {
    title
    key
    value

    constructor(title, key, value) {
        super()
        this.title = title
        this.key = key
        this.value = value
    }

    values() {
        return {
            [this.key]: this.value
        }
    }

    headers() {
        return {
            id: this.key, title: this.title
        }
    }

}
