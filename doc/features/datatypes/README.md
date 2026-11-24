# CQL data types to JavaScript types

When retrieving the value of a column from a `Row` object, the value is typed according to the following table.

CQL data type|JavaScript type
---|---
ascii|String
bigint|[Long / BigInt](numerical/README.md)
blob|[Buffer][buffer]
boolean|Boolean
counter|[Long / BigInt](numerical/README.md)
date|[LocalDate](datetime/README.md)
decimal|[BigDecimal](numerical/README.md)
double|[Number](numerical/README.md)
duration|[Duration](../../api/module-types-Duration.html)
float|[Number](numerical/README.md)
inet|[InetAddress](../../api/module-types-InetAddress.html)
int|[Number](numerical/README.md)
list|[Array](collections/README.md)
map|[Object / ECMAScript 6 Map](collections/README.md)
set|[Array / ECMAScript 6 Set](collections/README.md)
smallint|[Number](numerical/README.md)
text|String
time|[LocalTime](datetime/README.md)
timestamp|[Date](datetime/README.md)
timeuuid|[TimeUuid](uuids/README.md)
tinyint|[Number](numerical/README.md)
tuple|[Tuple](tuples/README.md)
uuid|[Uuid](uuids/README.md)
varchar|String
varint|[Integer](numerical/README.md)
vector|[Vector](collections/README.md)

## Encoding data 

When encoding data, on a normal execute with parameters, the driver tries to guess the target type based on the input
type. Values of type `Number` will be encoded as `double` (because `Number` is IEEE 754 double).

Consider the following example:

```javascript
const key = 1000;
client.execute('SELECT * FROM table1 where key = ?', [ key ]);
```

If the key column is of type `int`, the execution fails. There are two possible ways to avoid this type of problem, as
detailed below.

### Prepare your queries (recommended)

Using prepared statements provides multiple benefits. Prepared statements are parsed and prepared on the Cassandra nodes
and are ready for future execution. Also, the driver retrieves information about the parameter types which allows an
**accurate mapping between a JavaScript type and a Cassandra type**.

Using the previous example, setting the `prepare` flag in the queryOptions will fix it:

```javascript
// Prepare the query before execution 
client.execute('SELECT * FROM table1 where key = ?', [ key ], { prepare : true });
```

When using prepared statements, the driver prepares the statement once on each host to execute multiple times.

### Hinting the target data type

Providing parameter hints in the query options is another way around it.

```javascript
// Hint that the first parameter is an integer 
client.execute('SELECT * FROM table1 where key = ?', [ key ], { hints : ['int'] });
```

[buffer]: https://nodejs.org/api/buffer.html
