import { IMain, IDatabase, IInitOptions } from "pg-promise";
import pgPromise from "pg-promise";

const schema = process.env["POSTGRES_SCHEMA"] || "functional_validation_test";

const initOptions: IInitOptions<{}> = {
    schema,
    error(err, e) {
        if (e.cn) {
            console.error("Connection error: ", err);
            return;
        }
        console.error("Error when executing query: ", e.query, e.params ? "\nwith params: " : "", e.params ? e.params : "", e);
    },
    query(e) {
        // console.log('QUERY:', e.query);
    }
};

const pgp: IMain = pgPromise(initOptions);
const user: string = process.env["POSTGRES_USER"] || "postgres";
const password: string = process.env["POSTGRES_PASS"] || "";
const host: string = process.env["POSTGRES_HOST"] || "localhost";
const port: string = process.env["POSTGRES_PORT"] || "5432";
const dbname: string = process.env["POSTGRES_DB"] || "postgres";
const cn: string = process.env["GITHUB_ACTIONS"] ? "postgresql://postgres@localhost:5555/postgres" : `postgresql://${user}:${password}@${host}:${port}/${dbname}`;
export const db: IDatabase<any> = pgp(cn);
