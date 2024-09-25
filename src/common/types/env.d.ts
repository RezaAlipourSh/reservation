namespace NodeJS {
  interface ProcessEnv {
    //app
    PORT: number;
    //db
    DB_PORT: number;
    DB_NAME: string;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_HOST: string;

    // secret;
    COOKIE_SECRET: string;
    OTP_TOKEN_SECRET: string;
    ACCESS_TOKEN_SECRET: string;
    EMAIL_TOKEN_SECRET: string;
    PHONE_TOKEN_SECRET: string;
  }
}
