export class Artifact {
    groupId: string
    artifactId: string
    type: string
    version: string
    scope: string

    constructor(groupId, artifactId, type, version, scope) {
        this.groupId = groupId.trim();
        this.artifactId = artifactId.trim();
        this.type = type?.trim();
        this.version = version?.trim();
        this.scope = scope?.trim();
    }

    static parseDependencyString(str): Artifact {
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

    matching(other): boolean{
        return Object.entries(this)
            .filter(([_, value]) => !!value)
            .map(([key, _]) => key)
            .reduce((result, key) => result && this[key] === other[key], true)
    }

    identifier(): string {
        return `${this.groupId}:${this.artifactId}`
    }
}
