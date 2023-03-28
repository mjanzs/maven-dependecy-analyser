# maven-dependecy-analyser

```
node --loader ts-node/esm --experimental-specifier-resolution=node --dir=out --api-key="..." --definition=""
```

```
{
  "transpose": false,
  "org": "myOrg",
  "output": "out.csv",
  "analysers": [
    {
      "type": "include-lang"
    },
    {
      "type": "include-topics",
      "topics": [
        "tag"
      ]
    },
    {
      "type": "dependency-version",
      "poms": [
        "pom.xml"
      ],
      "dependencies": [
        "com.package:artifact"
      ]
    }
  ],
  "repos": [
    "my-service"
  ]
}
```
