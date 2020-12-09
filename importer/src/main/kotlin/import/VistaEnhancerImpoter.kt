package import

import Importer
import util.*
import java.io.*
import javax.sql.DataSource

private fun tableDef(assembly: String): String
    = """${assembly}_vista_enhancers(
        ccre,
        overlap,
        chromosome,
        startpos,
        endpos,
        accession,
        activity,
        tissues
    )"""

class VistaEnhancerImporter(private val sources: List<VistaEnhancerSource>): Importer {

    override fun import(dataSource: DataSource) {
        val assemblies = (sources.groupBy { it.assembly })
        assemblies.forEach { (assembly, sources) ->
            val replacements = mapOf("\$ASSEMBLY" to assembly)
            executeSqlResource(dataSource, "schemas/vista.sql", replacements)
            VistaEnhancerSink(dataSource, assembly).use { sink ->
                sources.forEach {
                    it.import(sink)
                }
            }
            executeSqlResourceParallel("vista indexing for $assembly", dataSource, "schemas/vista-post.sql", 1, replacements)
        }
    }

}

interface VistaEnhancerSource {
    val assembly: String
    fun import(sink: VistaEnhancerSink)
}

class VistaEnhancerSink(dataSource: DataSource, private val assembly: String) : Closeable {

    private val writer = CopyValueWriter(dataSource, tableDef(assembly))

    fun write(line: String) {
        val v = line.split("\t")
        writer.write(
            v[0], v[1], v[2], v[3], v[4], v[5], if (v[6] == "positive") "t" else "f",
            if (v[6] == "positive") "{" + v[7].split(",").map { it.trim().split("[")[0] }.joinToString(",") + "}" else "{}"
        )
    }

    override fun close()  {
        writer.close()
    }

}
