export class AnalyserResult {

    static empty(scan) {
        return new EmptyResult(scan)
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
    results: AnalyserResult[]

    constructor(scans, results) {
        super()
        this.scans = scans
        this.results = results
    }

    static reducer() {
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
            }
        }
    }

    values(): {[k: string]: any} {
        return this.results.reduce((acc, result) => {
            return {
                ...acc,
                ...result.values()
            }
        }, {} as {[k: string]: any})
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

    static fromSingleResults(results) {
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

class EmptyResult extends AnalyserResult {
    scan: string

    constructor(scan) {
        super()
        this.scan = scan
    }

    values(): [] {
        return []
    }

    headers() {
        return {
            id: this.scan, title: this.scan
        }
    }
}
