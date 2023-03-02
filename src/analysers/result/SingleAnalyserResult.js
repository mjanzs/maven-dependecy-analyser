import {AnalyserResult} from "./AnalyserResult.js";

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
