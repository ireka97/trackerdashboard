export default function getLogColor(log, fallback = "red") {
 if (log.offlineEnd) return "green"
 if (log.offline || log.offlineStart) return "orange"
 return fallback
}
