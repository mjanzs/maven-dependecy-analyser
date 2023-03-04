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
    value

    constructor(scan, value) {
        super()
        this.scan = scan
        this.value = value
    }

    values() {
        return {
            [this.scan]: this.value
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
