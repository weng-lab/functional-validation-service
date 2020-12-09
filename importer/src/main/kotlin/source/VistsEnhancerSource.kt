package source

import import.*
import mu.KotlinLogging
import okhttp3.OkHttpClient
import okhttp3.Request
import java.util.zip.GZIPInputStream
import java.io.*

private val log = KotlinLogging.logger {}
private val http by lazy { OkHttpClient() }

class VistaEnhancerHTTPSource(private val url: String, override val assembly: String): VistaEnhancerSource {

    override fun import(sink: VistaEnhancerSink) {
        log.info { "importing Vista enhancers for $assembly from $url" }
        val fileDownloadRequest = Request.Builder().url(url).get().build()
        val downloadInputStream = http.newCall(fileDownloadRequest).execute().body()!!.byteStream()
        BufferedReader(InputStreamReader(GZIPInputStream(downloadInputStream))).forEachLine {
            sink.write(it)
        }
    }

}

class VistaEnhancerFileSource(private val file: File, override val assembly: String): VistaEnhancerSource {

    override fun import(sink: VistaEnhancerSink) {
        log.info { "importing Vista enhancers for $assembly from ${file.name}" }
        BufferedReader(InputStreamReader(GZIPInputStream(FileInputStream(file)))).forEachLine {
            sink.write(it)
        }
    }

}
