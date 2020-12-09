import import.*
import io.kotlintest.*
import io.kotlintest.specs.StringSpec
import okhttp3.mockwebserver.*
import okio.*
import source.*
import java.io.File
import java.sql.*

const val BASE_DB_URL = "jdbc:postgresql://localhost:5555/postgres"
const val TEST_SCHEMA = "test"
const val DB_URL = "$BASE_DB_URL?currentSchema=$TEST_SCHEMA"
const val DB_USERNAME = "postgres"

class AppTest : StringSpec() {

    override fun afterTest(description: Description, result: TestResult) {
        executeAdminUpdates("DROP SCHEMA $TEST_SCHEMA CASCADE")
    }

    override fun beforeTest(description: Description) {
        executeAdminUpdates("DROP SCHEMA IF EXISTS $TEST_SCHEMA CASCADE", "CREATE SCHEMA $TEST_SCHEMA")
    }

    init {

        "VISTA enhancer import for hg38 from local path" {
            val testFile = File(AppTest::class.java.getResource("vista.GRCh38.subset.tsv.gz").file)
            val importers: List<Importer> = listOf(
                VistaEnhancerImporter(listOf(VistaEnhancerFileSource(testFile, "hg38")))
            )
            runImporters(DB_URL, DB_USERNAME, dbSchema = TEST_SCHEMA, replaceSchema = true, importers = importers)
            checkQuery("SELECT COUNT(*) FROM hg38_vista_enhancers") { result ->
	            result.next()
		        result.getInt(1) shouldBe 5
            }
            checkQuery("SELECT COUNT(*) FROM hg38_vista_enhancers WHERE 'heart' = ANY(tissues)") { result ->
                result.next()
                result.getInt(1) shouldBe 3
            }
        }

        "VISTA enhancer import for mm10 over HTTP" {
            val server = MockWebServer()
            server.start()
            server.queueBytesFromResource("vista.mm10.subset.tsv.gz")
            val importers: List<Importer> = listOf(
                VistaEnhancerImporter(listOf(VistaEnhancerHTTPSource(server.url("").toString(), "mm10")))
            )
            runImporters(DB_URL, DB_USERNAME,dbSchema = TEST_SCHEMA, replaceSchema = true, importers = importers)
            checkQuery("SELECT COUNT(*) FROM mm10_vista_enhancers") { result ->
                result.next()
                result.getInt(1) shouldBe 5
            }
            checkQuery("SELECT COUNT(*) FROM mm10_vista_enhancers WHERE 'forebrain' = ANY(tissues)") { result ->
                result.next()
                result.getInt(1) shouldBe 2
            }
        }

    }

}

fun checkQuery(sql: String, check: (result: ResultSet) -> Unit) {
    DriverManager.getConnection(DB_URL, DB_USERNAME, null).use { conn ->
        conn.createStatement().use { stmt ->
            check(stmt.executeQuery(sql))
        }
    }
}

fun executeAdminUpdates(vararg sqlUpdates: String) {
    DriverManager.getConnection(BASE_DB_URL, DB_USERNAME, null).use { conn ->
        conn.createStatement().use { stmt ->
            for(sql in sqlUpdates) stmt.executeUpdate(sql)
        }
    }
}

fun MockWebServer.queueBytesFromResource(resource: String) {
    val body = Buffer()
    body.writeAll(Okio.source(File(AppTest::class.java.getResource(resource).file)))
    this.enqueue(MockResponse().setBody(body))
}
