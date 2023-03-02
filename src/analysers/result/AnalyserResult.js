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
