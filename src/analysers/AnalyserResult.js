export class AnalyserResult {

    static empty() {
        return new class EmptyResult extends AnalyserResult {
            asMap() {
                return {}
            }
        }
    }

    asMap() {
        throw new Error()
    }

}

export class MultiAnalyserResult extends AnalyserResult {
    results

    constructor(results) {
        super()
        this.results = results
    }

    asMap() {
        return this.results.reduce((acc, result) => {
            return {
                ...acc,
                ...result.asMap()
            }
        }, {})
    }
}

export class SingleAnalyserResult extends AnalyserResult {
    key
    value

    constructor(key, value) {
        super()
        this.key = key
        this.value = value
    }

    asMap() {
        return {
            [this.key]: this.value
        }
    }

}
