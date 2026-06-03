# TypeScript Migration Proposal

There are three reasons that make this the right moment for the driver’s TypeScript migration:

1\. Type safety – TypeScript has become the standard for maintaining large Node.js libraries. 

2\. ES Modules – ESM is now the official JavaScript module standard, and the ecosystem has largely settled on it. 

3\. ES6 classes – The driver's class style is split across ES5 and ES6 conventions. The ES5 style `util.inherits()` is deprecated by Node.js, and ES5 style classes are not recognized by modern tools like IDE intellisense.

Peer projects have made this move and reported this change made their codebases easier to maintain and evolve safely.

---

# 1\. Type Safety: Catching a Class of Bugs Earlier

The driver pays the cost of types (someone writes index.d.ts) without the benefit (existing tests do not ensure the type declaration align with internal implementation). 

Type safety, together with Intellisense that TypeScript migration can bring, could have caught a lot of bugs, for example:

| Ticket | Bug | How TypeScript prevents it |
| ----- | ----- | ----- |
| [NODEJS-645](https://github.com/datastax/nodejs-driver/commit/7701031) — missing protocolVersion.v6 in .d.ts | New constant added to JS source; declaration file not updated | Generated declarations cannot drift from the source |
| [NODEJS-633](https://github.com/datastax/nodejs-driver/pull/383) — "cannot read property 'executor'" | Property access on null/undefined reached production | strictNullChecks makes this a compile error |
| [NODEJS-681](https://github.com/apache/cassandra-nodejs-driver/pull/462) — ControlConnection Concurrent Read and Write on .host and .connection  | Property access on null/undefined reached production | strictNullChecks makes this a compile error |
| [NODEJS-682](https://github.com/datastax/nodejs-driver/pull/429) — deprecated util.isDate / util.isString used for a decade | APIs deprecated in Node.js v4.0 (2015) still in use in 2024 | @deprecated annotations surface in-editor by Intellisense |
| [\#432](https://github.com/apache/cassandra-nodejs-driver/pull/432) — retry passes a number where an Error is expected | A copy-paste mistake in the socket error retry path sent a numeric value downstream; code attempting to set .coordinator on it crashed in strict mode: *"Cannot create property 'coordinator' on number"* | A parameter typed as Error cannot receive a number |

---

# 2\. Why ES6+ Classes Matter

The driver uses two class styles. Classes like lib/host.js use the modern ES6 class syntax. lib/errors.js and others still use the ES5 util.inherits(), which has been [officially marked as legacy since Node.js v14 (2020)](https://nodejs.org/api/util.html#utilinheritsconstructorsuperconstructor).

Migration from ES5 to ES6 style classes enables:

* IDE intellisense and type checks to actually recognize those classes and their fields and methods.  
* super() over DriverError.call(this, message), Private/readonly keywords over Object.defineProperty({ writable: false })  
* Enhance readability and enables further optimizations, e.g. hidden classes and better subclassing  
* Pave our ways to modern features and optimizations, e.g. ES2024 features and v8-friendly code

---

# 3\. Why ESM Matters

CommonJS (require) was built specifically for Node.js before JavaScript had an official module system. ES Modules (import/export) is that official system. It is the JavaScript language specification and supported natively across Node.js (≥12), browsers, and Deno.

**Ecosystem alignment**. 32% of popular npm packages support ESM, increased from 8% in 2021\. Supporting ESM keeps the driver composable with the direction the ecosystem is moving.

**Named imports and exports**. CommonJS modules export a single module.exports object, so consumers must import the entire module to access any part of it. ESM's export declarations let consumers import exactly what they need ( import { Client } from 'cassandra-driver' ), making the API surface explicit and navigable in editors and documentation, which is also the common practice by popular NPM packages.

**Backwards-compatible**. TypeScript can emit both CJS and ESM from one source. The exports field in package.json routes each consumer to the right build automatically, existing require() code is completely unaffected.

---

# 4\. Additional Benefits

* **Easier to attract new community contributors**. Most new JavaScript developers are only familiar with modern frameworks like TypeScript, ES6+ and ESM syntax.  
* **IDE Intellisense and type-aware linting**. typescript-eslint rules like no-floating-promises and await-thenable catch async bugs that syntax-only ESLint cannot.  
* **Auto-generated docs**. TypeDoc generates API documentation from TypeScript source. Always accurate, no manual @ignore workarounds.  
* **Accurate type declarations**, for free. The hand-maintained .d.ts files are replaced by auto-generated ones that are correct by construction.

---

# 5\. Where the Ecosystem Is Heading

State of JS 2025 [user survey](https://2025.stateofjs.com/en-US/usage/) shows that JS/TS developers in the world write 77% TypeScript and 23% JavaScript. Node.js added native TypeScript support since v23.

Other major peer database drivers or SDKs have also completed this migration, for the same reasons we face today.

* [MongoDB Node.js driver v4 (2021)](https://www.mongodb.com/docs/drivers/node/current/typescript/) — Rewrote the driver and the BSON library in TypeScript. Then in [v5 (2023)](https://github.com/mongodb/node-mongodb-native/blob/main/etc/notes/CHANGES_5.0.0.md) dropped callbacks entirely: *"Node.js driver v5 drops support for callbacks in favor of a Promise-only API."* TypeScript was the safety net that made dropping the legacy API feasible.  
* [AWS SDK for JavaScript v3 (2020)](https://github.com/aws/aws-sdk-js-v3) — Complete TypeScript rewrite. Amazon cited first-class type safety and ESM tree-shaking as primary motivations, and documented [measurable Lambda cold-start improvements](https://aws.amazon.com/blogs/developer/reduce-lambda-cold-start-times-migrate-to-aws-sdk-for-javascript-v3/) as a result.  
* [Elasticsearch Node.js client v8 (2021)](https://github.com/elastic/elasticsearch-js/issues/1542) — Transport layer rewritten in TypeScript. From their roadmap: *"thanks to the new types we are developing, we now know exactly where a parameter should go"*. Enabling API simplifications that were too risky to attempt without the compiler's safety net.  
* [node-redis v4 (2022)](https://github.com/redis/node-redis/blob/master/docs/v3-to-v4.md) — Full TypeScript rewrite, Promise-only API, cleaned-up configuration surface. Same pattern as MongoDB.

---

# 6\. Backward Compatibility

The migration is designed to be non-breaking for the vast majority of users. Their existing application code will continue to work without modification.

## 6.1 `import X = A.B.C` Syntax

The driver uses nested namespaces (e.g. `cassandra.auth.PlainTextAuthProvider`), a pattern that is uncommon in the npm ecosystem and has no first-class representation in TypeScript's type system.

A post-processing script applied to the generated `.d.ts` file can bridge this gap: it removes the auto-generated `const` declaration for each submodule and replaces it with an equivalent `namespace` block that re-declares each public class both as an interface (for `instanceof` checks) and as a constructable class.

```ts
// Remove the following from cassandra-driver-public.d.ts
export declare const auth: {
    Authenticator: typeof Authenticator;
    AuthProvider: typeof AuthProvider;
    PlainTextAuthProvider: typeof PlainTextAuthProvider;
    // ...
};

// Append the following to cassandra-driver-public.d.ts
type __auth_Authenticator = typeof Authenticator;
type __auth_AuthProvider = typeof AuthProvider;
type __auth_PlainTextAuthProvider = typeof PlainTextAuthProvider;

export namespace auth {
    export declare interface Authenticator extends InstanceType<__auth_Authenticator> {}
    export declare class Authenticator { constructor(...args: ConstructorParameters<__auth_Authenticator>); }
    export declare interface AuthProvider extends InstanceType<__auth_AuthProvider> {}
    export declare class AuthProvider { constructor(...args: ConstructorParameters<__auth_AuthProvider>); }
    export declare interface PlainTextAuthProvider extends InstanceType<__auth_PlainTextAuthProvider> {}
    export declare class PlainTextAuthProvider { constructor(...args: ConstructorParameters<__auth_PlainTextAuthProvider>); }
    // ...
}

```
This preserves backward compatibility for the following import style:

```js
import cassandra = require('cassandra-driver');
import PlainTextAuthProvider = cassandra.auth.PlainTextAuthProvider;
```

This approach is fragile and difficult to maintain. Submodule namespaces such as `auth` and `types` should be marked deprecated in 5.x and removed in 6.x.

## 6.2 Default Export vs. Named Export

The driver currently exposes CommonJS `module.exports` objects, while the TypeScript ecosystem has standardized on named exports. To support both styles during the transition, each submodule's `index.ts` must export its public API twice, once as named exports and once as the default object:

```ts
// lib/auth/index.ts
export {
  Authenticator,
  AuthProvider,
  DseGssapiAuthProvider,
  DsePlainTextAuthProvider,
  /** @internal */
  NoAuthProvider,
  PlainTextAuthProvider
};

export default {
  Authenticator,
  AuthProvider,
  DseGssapiAuthProvider,
  DsePlainTextAuthProvider,
  /** @internal */
  NoAuthProvider,
  PlainTextAuthProvider
};

```

This allows all of the following import styles to continue working:

```ts
import cassandra = require('cassandra-driver');
import { PlainTextAuthProvider } from 'cassandra-driver';
import { auth } from 'cassandra-driver';
```

This is a transitional workaround, not standard practice in the ecosystem. Any classes added to the driver after the migration should be exported as named exports only, not added to the default export object.

## 6.3 Misuse of `new` Keyword

Applying the `new` keyword to a static method will throw after the migration. For example, `new LocalTime.now()` where `LocalTime.now()` is a static factory method, not a constructor. Older versions of Node.js silently permitted this; once `LocalTime` is an ES6 class, the runtime raises a `TypeError`. This is a pre-existing misuse that callers must correct, not a regression the driver should absorb.

---

# 7\. Conclusion

The cassandra-driver already pays the cost of manually maintained declaration files. This migration will eliminate that cost while delivering the full benefit and maintaining backward compatibility: 

1. A compiler that validates the implementation against its own types  
2. ESM support that aligns with the eco-system
3. IDE Intellisense that actually recognizes our classes and types, providing better developer experience for maintainers and contributors  
4. Enforced type safety that can catch bugs early, and so much more