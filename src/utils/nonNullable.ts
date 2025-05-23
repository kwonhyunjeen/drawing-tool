export function nonNullable<Value>(value: Value): value is NonNullable<Value> {
  return value != undefined;
}
