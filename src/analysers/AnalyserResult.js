export class AnalyserResult {

    static empty(scan) {
        return new EmptyResult(scan)
    }

    values() {
        throw new Error()
    }

    headers() {
        throw new Error()
    }
}

export class MultiAnalyserResult extends AnalyserResult {
    scans
    results

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

    static fromSingleResults(results) {
        const map = results.reduce((acc, r) => {
            acc[r.scan] = r
            return acc
        }, {});
        return new MultiAnalyserResult(Object.keys(map), Object.values(map))
    }
}

export class SingleAnalyserResult extends AnalyserResult {
    scan
    result

    constructor(scan, result) {
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
            id: this.scan, title: this.title
        }
    }

}

class EmptyResult extends AnalyserResult {
    constructor(scan) {
        super()
        this.scan = scan
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
