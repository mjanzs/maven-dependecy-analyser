export class Artifact {
    groupId
    artifactId
    type
    version
    scope

    constructor(groupId, artifactId, type, version, scope) {
        this.groupId = groupId.trim();
        this.artifactId = artifactId.trim();
        this.type = type?.trim();
        this.version = version?.trim();
        this.scope = scope?.trim();
    }

    static parseDependencyString(str) {
        const regex = /([^:]+):([^:]+):?([^:]*):?([^:]*):?([^:]*)/;
        let [_,
            groupId,
            artifactId,
            type,
            version,
            scope] = regex.exec(str) || [];
        return new Artifact(
            groupId,
            artifactId,
            type || undefined,
            version || undefined,
            scope || undefined)
    }

    matching(other) {
        return Object.entries(this)
            .filter(([_, value]) => !!value)
            .map(([key, _]) => key)
            .reduce((result, key) => result && this[key] === other[key], true)
    }

    identifier() {
        return `${this.groupId}:${this.artifactId}`
    }
}
