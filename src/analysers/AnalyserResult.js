export class AnalyserResult {
    key
    value

    constructor(key, value) {
        this.key = key
        this.value = value
    }

    static empty() {
        return new class EmptyResult extends AnalyserResult {
            asMap() {
                return {}
            }
        }
    }

    asMap() {
        return {
            [this.key]: this.value
        }
    }

}
