import {AnalyserResult} from "./AnalyserResult.js";

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
