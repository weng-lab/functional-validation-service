import com.github.ajalt.clikt.core.CliktCommand
import com.github.ajalt.clikt.parameters.options.*
import com.github.ajalt.clikt.parameters.types.*
import import.*
import source.*
import com.zaxxer.hikari.*
import javax.sql.DataSource
import util.withEnvvarSplit
import java.sql.DriverManager
import java.io.*

fun main(args: Array<String>) = Cli().main(args)

class Cli : CliktCommand() {

    private val vistaUrls by option(
        "-vistaurl", "--vista-urls", envvar = "VISTA_URLS",
        help = "Vista enhancer URLs paired with assemblies (URL;assembly|URL;assmebly)"
    ).withEnvvarSplit(Regex.fromLiteral("|")).multiple()
    private val vistaPaths by option(
        "-vistapath", "--vista-paths", envvar = "VISTA_PATHS",
        help = "Vista enhancer paths; must be paired with --vista-path-assemblies"
    ).file(exists = true).multiple()
    private val vistaPathAssemblies by option(
        "-vistapathassemblies", "--vista-path-assemblies", envvar = "VISTA_PATH_ASSEMBLIES",
        help = "Assemblies for each local path passed via --vista-path-assemblies"
    ).multiple()

    private val dbUrl by option("--db-url", envvar = "DB_URL").required()
    private val dbUsername by option("--db-username", envvar = "DB_USERNAME")
    private val dbPassword by option("--db-password", envvar = "DB_PASSWORD")
    private val dbSchema by option("--db-schema", envvar = "DB_SCHEMA")
    private val replaceSchema by option("--replace-schema", envvar = "REPLACE_SCHEMA",
            help = "Set to drop the given schema first before creating it again.")
            .flag(default = false)

    override fun run(){

        val importers: List<Importer> = listOf(

            // VISTA enhancers intersected with cCREs
            VistaEnhancerImporter(
                vistaUrls.map {
                    val s = it.split(";")
                    return@map VistaEnhancerHTTPSource(s[0], s[1])
                } + vistaPaths.mapIndexed { i, it ->
                    VistaEnhancerFileSource(it, vistaPathAssemblies[i])
                }
            )

        )

        runImporters(dbUrl, dbUsername, dbPassword, dbSchema, replaceSchema, importers)

    }
}

interface Importer {
    fun import(dataSource: DataSource)
}

fun runImporters(dbUrl: String,
              dbUsername: String? = null,
              dbPassword: String? = null,
              dbSchema: String? = null,
              replaceSchema: Boolean = false,
              importers: List<Importer>) {

    // Create the schema if it does not exist.
    DriverManager.getConnection(dbUrl, dbUsername, dbPassword).use { conn ->
        conn.createStatement().use { stmt ->
            if (replaceSchema) {
               stmt.executeUpdate("DROP SCHEMA IF EXISTS $dbSchema CASCADE")
            }
           stmt.executeUpdate("CREATE SCHEMA IF NOT EXISTS $dbSchema")
        }
    }
    val config = HikariConfig()
    config.jdbcUrl = dbUrl
    config.username = dbUsername
    config.password = dbPassword
    config.schema = dbSchema
    config.minimumIdle = 1
    config.maximumPoolSize = 100

    HikariDataSource(config).use { dataSource ->
        for (importer in importers) {
            importer.import(dataSource)
        }
    }
}
