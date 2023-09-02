import { env_vars, sign_jwt } from "./client_side_incompatible_utils.js";
var jwt = sign_jwt(env_vars().jwt_secret, 7, { user_id: -1 });
console.log(jwt);
