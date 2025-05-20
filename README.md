# React Betting Table

Render a scalable table containing odds about randomly generated matches. Odds keep changing using a loosely mocked WebSocket server based on EventTarget.

Based on [React-Virtualized](https://github.com/bvaughn/react-virtualized)

Assets from [Reshot](https://www.reshot.com)

## Caveats

The method used for storing data is IndexedDB, which is pretty slow for the initial write of thousands of match entries

Storing JSON in Localstorage has been tried as an alternative, but it has very limited capacity (usually up to 2.5MB)

Tried compression, but it came with another challenge - correctly storing and retrieving UTF-8 data (it is the most used format in compression algorithms) in UTF-16 format that is required by Localstorage. So the idea was scrapped

It's worth noting the code is really unoptimized for big data in favor of retaining immutability and declarative programming widely used in React ecosystem

In the perfect scenario I would recommend using refs for storing data and directly manipulating it. Then generate a hash for each operation to force updating components through useState

## Running
`npm run dev` to run a dev server

`npm run build` to bundle the project

`npm run lint` to check for lint errors