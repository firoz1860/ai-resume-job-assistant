// Shared MongoDB ObjectId validator. Guards controllers so a malformed :id
// returns 404 instead of throwing a Mongoose CastError (surfacing as 500).
export function isValidMongoId(value) {
  return /^[a-f\d]{24}$/i.test(String(value || ''));
}
