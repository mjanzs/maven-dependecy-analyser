export class Artifact {
    groupId
    artifactId
    type
    version
    scope

    constructor(groupId, artifactId, type, version, scope) {
        this.groupId = groupId;
        this.artifactId = artifactId;
        this.type = type;
        this.version = version;
        this.scope = scope;
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
}
