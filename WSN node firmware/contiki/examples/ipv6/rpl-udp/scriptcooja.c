TIMEOUT(600000);

/* Estas son las secuencias de salto de canal por defecto en IEEE 802.15.4e */ 
hopping_seq_16 = [16, 17, 23, 18, 26, 15, 25, 22, 19, 11, 12, 13, 24, 14, 20, 21];
hopping_seq_4 = [15, 25, 26, 20];
hopping_seq_2 = [20, 25];
hopping_seq_1 = [ 20 ];

/* Definimos la secuencia de canales que se va a utilizar */
hopping_seq = hopping_seq_4;

/* Esta es la función que calcula el canal a partir del ASN y el channel offset*/ 
function calculate_channel(asn_t, channel_offset){
    var index_off = (asn_t + channel_offset) % hopping_seq.length;
    return hopping_seq[index_off];
}

rssi_values = [-58, -59, -60, -61, -62, -63, -64, -65, -66, -67, -68, -69, -70, -71, -72, -73];

asn = 0;
ts = 0;

timeslot = 1000;

edges = mote.getSimulation().getRadioMedium().getEdges();

while (true) {
    log.log("longitud "+edges.length+"\n");
    if (ts < edges.length) {
	    for (var i in edges) {
	        asn++;
            ts++;
            log.log("\nEl actual ASN es: " + asn + "\n");
            log.log("El ts es: " +ts+"\n");
	        /*valor = Math.floor((Math.random() * 30) - 90);*/
	        edges[i].superDest.signal = rssi_values[(asn+i)%rssi_values.length];
	        log.log("Enlace " + i + " - Canal: " + calculate_channel(asn,i) + " - RSSI: " + edges[i].superDest.signal + "\n");
	        GENERATE_MSG(timeslot, "wait");
	        YIELD_THEN_WAIT_UNTIL(msg.equals("wait"));
	    }
    } else {
        asn++;
        ts++;
        log.log("\nEl actual ASN es: " + asn + "\n");
        log.log("El ts es: " +ts+"\n");
        GENERATE_MSG(timeslot, "wait");
	    YIELD_THEN_WAIT_UNTIL(msg.equals("wait"));
        if(ts > 16) {ts = 0;}
    }
}
