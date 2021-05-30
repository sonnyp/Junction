export function logEnum(obj, value) {
  log(
    Object.entries(obj).find(([k, v]) => {
      return v === value;
    })[0],
  );
}
