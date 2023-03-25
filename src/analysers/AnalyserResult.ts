export class AnalyserResult {

    static empty(scan, value?) {
        return new EmptyResult(scan, value)
    }

    values(): {[k: string]: any} {
        throw new Error()
    }

    headers(): {[k: string]: any} {
        throw new Error()
    }
}

export class MultiAnalyserResult extends AnalyserResult {
    scans: string[]
    results: SingleAnalyserResult[]

    constructor(scans, results) {
        super()
        this.scans = scans
        this.results = results
    }

    static reducer(): (acc: MultiAnalyserResult, AnalyserResult) => MultiAnalyserResult {
        return (acc, item) => {
            const result = acc || new MultiAnalyserResult([], [])
            switch (true) {
                case item instanceof SingleAnalyserResult:
                    return new MultiAnalyserResult(
                      [...result.scans, item.scan],
                      [...result.results, item])
                case item instanceof MultiAnalyserResult:
                    return new MultiAnalyserResult(
                      [...result.scans, ...item.scans],
                      [...result.results, ...item.results])
                default:
                    throw new Error();
            }
        }
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
        return this.scans.map(scan => {
            return {
                id: scan, title: scan
            }
        })
    }

    // *[Symbol.iterator]() {
    //     for (let r of this.results) {
    //         yield r;
    //     }
    // }

    static fromSingleResults(results: SingleAnalyserResult[]) {
        const map = results.reduce((acc, r) => {
            acc[r.scan] = r
            return acc
        }, {});
        return new MultiAnalyserResult(Object.keys(map), Object.values(map))
    }
}

export class SingleAnalyserResult extends AnalyserResult {
    scan: string
    result: string

    constructor(scan: string, result: string) {
        super()
        this.scan = scan
        this.result = result
    }

    values() {
        return {
            [this.scan]: this.result
        }
    }

    headers() {
        return {
            id: this.scan, title: this.scan
        }
    }

}

export class EmptyResult extends SingleAnalyserResult {

    constructor(scan, result?: string) {
        super(scan, result ?? '')
    }

    values() {
        return {}
    }

    headers() {
        return {
            id: this.scan, title: this.scan
        }
    }
}
