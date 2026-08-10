from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Información de la aplicación
    app_name: str
    app_version: str
    app_env: str

    # Servidor
    host: str
    port: int

    # MongoDB
    mongodb_uri: str
    mongodb_database: str

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8"
    )


settings = Settings()