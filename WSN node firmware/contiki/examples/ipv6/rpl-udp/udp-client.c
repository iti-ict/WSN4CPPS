/*
 APPLICATION CODE FOR WSN4CPPS
 Author: ITI
 *
 */

#include "contiki.h"
#include "contiki-lib.h"
#include "contiki-net.h"
#include "dev/radio.h"
#include "net/netstack.h"
#include "lib/random.h"
#include "sys/ctimer.h"
#include "net/ip/uip.h"
#include "net/ipv6/uip-ds6.h"
#include "net/ipv6/uip-ds6-nbr.h"
#include "net/ip/uip-udp-packet.h"
#include "net/rpl/rpl-private.h"
#include "net/rpl/rpl-ns.h"
#include "net/rpl/rpl.h"
#include "orchestra.h"
#include "net/packetbuf.h"
#include "net/rime/timesynch.h"
#include "net/mac/tsch/tsch.h"
#include "net/mac/tsch/tsch-rpl.h"
#include "sys/rtimer.h"
#include "sys/etimer.h"
#include "dev/leds.h"
#include "ext-led.h"
#include "dev/cc2538-sensors.h"
#include "dev/cc2538-rf.h"
#include "dev/adc-sensors.h"
#include "dev/adc.h"
#include "dev/i2c.h"
#include "dev/gpio.h"
#include "dev/relay.h"
#include "lib/sensors.h"
#include "dev/DS18B20.h"
#include "dev/adxl345.h"
#include "dev/jc10f.h"
#include "collect-common.h"
#include "collect-view.h"
#ifdef WITH_COMPOWER
#include "powertrace.h"
#endif
#include <stdio.h>
#include <string.h>
#include <stdlib.h>  //only for the random generator, can be deleted when drivers complete
#include <stdint.h>
#include "sys/clock.h"
#include "net/nbr-table.h"
#include "net/link-stats.h"
#include "dev/button-sensor.h"
/* Only for TMOTE Sky? */
#include "dev/serial-line.h"
#include "dev/uart1.h"
#include "net/ipv6/uip-ds6-route.h"
/*only for openmote*/
//#include "dev/sht21.h"
/**********/
#define UDP_CLIENT_PORT 8765
#define UDP_SERVER_PORT 5678


#define UDP_EXAMPLE_ID  190

//#define DEBUG DEBUG_FULL
#include "net/ip/uip-debug.h"
#define UIP_IP_BUF   ((struct uip_ip_hdr *)&uip_buf[UIP_LLH_LEN])
#ifndef PERIOD
#define PERIOD 2
#endif

#define START_INTERVAL		(1 * CLOCK_SECOND)
#define SEND_INTERVAL		(PERIOD * CLOCK_SECOND)
#define SEND_TIME		    (PERIOD * CLOCK_SECOND)
#define SEND_Q_INTERVAL		(5 * CLOCK_SECOND)
//#define SEND_TIME		(random_rand() % (SEND_INTERVAL))

#define MAX_PAYLOAD_LEN		40



static struct uip_udp_conn *client_conn;
static uip_ipaddr_t server_ipaddr;
radio_value_t radio_last_rssi;
radio_value_t radio_channel;
static uint16_t Q=65535;
static uint16_t ipso=3303;
uip_ipaddr_t dest_addr;

/*---------------------------------------------------------------------------*/
PROCESS(udp_client_process, "UDP client process");
AUTOSTART_PROCESSES(&udp_client_process);
/*---------------------------------------------------------------------------*/
static int seq_id=0;
static int seq_id2=0;
static int reply;
static int fail_cont=0;
/*---------------------------------------------------------------------------*/
static void
tcpip_handler(void)
{
  char *str;

  if(uip_newdata()) {
    str = uip_appdata;
    str[uip_datalen()] = '\0';
    reply++;
   // printf("DATA recv '%s' (s:%d, r:%d)\n", str, seq_id, reply);
    if(strcmp(str,"3313")){ipso=3313;}
    if(strcmp(str,"3303")){ipso=3303;}
  }

}
/*---------------------------------------------------------------------------*/
static void
send_quality(void *ptr)
{
  char buf[MAX_PAYLOAD_LEN];
  int numvec=0;
  uint16_t parent_etx=0;

  rpl_dag_t *dag;
  rpl_parent_t *par_addr;
  linkaddr_t parent;
  seq_id++;
  dag = rpl_get_any_dag();
  if(dag != NULL) {
    par_addr = dag->preferred_parent;
    if(par_addr != NULL) {
      uip_ds6_nbr_t *nbr;
      nbr = uip_ds6_nbr_lookup(rpl_get_parent_ipaddr(par_addr));
      if(nbr != NULL) {
        /* Use parts of the IPv6 address as the parent address, in reversed byte order. */
        parent.u8[LINKADDR_SIZE - 1] = nbr->ipaddr.u8[sizeof(uip_ipaddr_t) - 2];
        parent.u8[LINKADDR_SIZE - 2] = nbr->ipaddr.u8[sizeof(uip_ipaddr_t) - 1];
        Q=rpl_rank_via_parent(par_addr);
      }
    }
	numvec=uip_ds6_nbr_num();
  } else {
    Q=65535;
    numvec = 0;
  }

/*Se obtiene la lladdr del padre*/
//rpl_parent_t *par_addr = nbr_table_head(rpl_parents);

/*Se cogen las estadisticas del enlace con el padre*/
const struct link_stats *stats = rpl_get_parent_link_stats(par_addr);
parent_etx = stats->etx;

NETSTACK_RADIO.get_value(RADIO_PARAM_LAST_RSSI, &radio_last_rssi);
NETSTACK_RADIO.get_value(RADIO_PARAM_CHANNEL, &radio_channel);

numvec=uip_ds6_nbr_num();
parent_etx = stats->etx;
if(Q<6500){
printf("SENDING QUALITY AND STATS INFO after checking connection\n");
sprintf(buf, "Q,%d,%d,%d,%d,%u,%u,%d,%d",seq_id,numvec,(signed)radio_last_rssi,radio_channel,parent_etx,Q,parent.u8[LINKADDR_SIZE - 1],parent.u8[LINKADDR_SIZE - 2]);

  uip_udp_packet_sendto(client_conn, buf, strlen(buf),
                        &server_ipaddr, UIP_HTONS(UDP_SERVER_PORT));
                        }
}
/*---------------------------------------------------------------------------*/
static void
send_packet(void *ptr)
{
  char buf[MAX_PAYLOAD_LEN];



  int16_t temp;

  seq_id2++;

uint16_t valueX = 0;
uint16_t valueY = 0;
uint16_t valueZ = 0;
uint16_t consum = 0; //for energy probe measure
uint16_t rele = 0;  // for relay state

/*-------------------------for openmote---------------------------*/
//temp = sht21.value(SHT21_READ_TEMP);
//temp=  GPIO_READ_PIN(PORT_BASE, PIN_MASK);
//sprintf(buf, "3302,%d.%u,%d,%d,%d,%d,%u,%u,%d,%d",temp, 0,seq_id,numvec,(signed)radio_last_rssi,radio_channel,parent_etx,Q,parent.u8[LINKADDR_SIZE - 1],parent.u8[LINKADDR_SIZE - 2]);

/*-------------------------for ReMote------------------------------*/
    temp = Read_Temperature(); //initiates a temperature reading for external probe
    //printf("%d",temp);
    valueX = adxl345.value(X_AXIS);
    valueY = adxl345.value(Y_AXIS);
    valueZ = adxl345.value(Z_AXIS);
    //consum=rand() % 800;
    consum =jc10f.value(VADC1);
    rele=relay.status(SENSORS_ACTIVE);

 if(Q<6500){
 // printf("SENDING SENSOR INFO: %d,%d,%d,%d,%d,%d,%d",seq_id,temp,valueX,valueY,valueZ,consum,rele);
//temp=cc2538_temp_sensor.value(CC2538_SENSORS_VALUE_TYPE_CONVERTED)/1000;
  sprintf(buf, "%d,%d,%d,%d,%d,%d,%d",seq_id2,temp,valueX,valueY,valueZ,consum,rele);

  uip_udp_packet_sendto(client_conn, buf, strlen(buf),
                        &server_ipaddr, UIP_HTONS(UDP_SERVER_PORT));

}
}

/*--------------------------------------------------------------------------------*/
static int C_test(void){
        //PRINTF("\n\ntsch status queue=%d \n\n\n",isfailed());
	if(isfailed()==0){
		fail_cont=0; return 1;
	}else{
		fail_cont++;
		if(fail_cont>0){return 0;}else{return 1;}
	}
}

/*---------------------------------------------------------------------------*/

static void
q_test(int act){
     if(act==0){
          //PRINTF("Quality test activated, wait for LED interface...\n");
	  extled_off();
          if(C_test()==1){
		  //rpl_parent_t *par_addr = nbr_table_head(rpl_parents);
		 // uint16_t Q=rpl_rank_via_parent(par_addr);
		  if(Q>=4096){
			extled_on(RED); //blanco azulado
		  }
		  if(Q<512){
			extled_on(GREEN);//blanco amarillento
		  }
		  if(Q>=512 && Q<1024){
			extled_on(BLUE);//amarillo
		  }
		  if(Q>=1024 && Q<4096){
			extled_on(PURPLE);
		  }
	}else{extled_on(RED);PRINTF("No conection");}
      }else{PRINTF("Turning off LED interface...\n");extled_off();}
}
/*---------------------------------------------------------------------------*/
static void
print_local_addresses(void)
{
  int i;
  uint8_t state;

  PRINTF("Client IPv6 addresses: ");
  for(i = 0; i < UIP_DS6_ADDR_NB; i++) {
    state = uip_ds6_if.addr_list[i].state;
    if(uip_ds6_if.addr_list[i].isused &&
       (state == ADDR_TENTATIVE || state == ADDR_PREFERRED)) {
      PRINT6ADDR(&uip_ds6_if.addr_list[i].ipaddr);
      PRINTF("\n");
      /* hack to make address "final" */
      if (state == ADDR_TENTATIVE) {
	uip_ds6_if.addr_list[i].state = ADDR_PREFERRED;
      }
    }
  }
}
/*---------------------------------------------------------------------------*/
static void
set_global_address(void)
{
  uip_ipaddr_t ipaddr;

  uip_ip6addr(&ipaddr, UIP_DS6_DEFAULT_PREFIX, 0, 0, 0, 0, 0, 0, 0);
  uip_ds6_set_addr_iid(&ipaddr, &uip_lladdr);
  uip_ds6_addr_add(&ipaddr, 0, ADDR_AUTOCONF);

/* The choice of server address determines its 6LoWPAN header compression.
 * (Our address will be compressed Mode 3 since it is derived from our
 * link-local address)
 * Obviously the choice made here must also be selected in udp-server.c.
 *
 * For correct Wireshark decoding using a sniffer, add the /64 prefix to the
 * 6LowPAN protocol preferences,
 * e.g. set Context 0 to fd00::. At present Wireshark copies Context/128 and
 * then overwrites it.
 * (Setting Context 0 to fd00::1111:2222:3333:4444 will report a 16 bit
 * compressed address of fd00::1111:22ff:fe33:xxxx)
 *
 * Note the IPCMV6 checksum verification depends on the correct uncompressed
 * addresses.
 */

#if 0
/* Mode 1 - 64 bits inline */
   uip_ip6addr(&server_ipaddr, UIP_DS6_DEFAULT_PREFIX, 0, 0, 0, 0, 0, 0, 1);
#elif 1
/* Mode 2 - 16 bits inline */
//  uip_ip6addr(&server_ipaddr, UIP_DS6_DEFAULT_PREFIX, 0, 0, 0, 0, 0x00ff, 0xfe00, 1);
uip_ip6addr(&server_ipaddr, UIP_DS6_DEFAULT_PREFIX, 0, 0, 0, 0, 0, 0, 1);
#else
/* Mode 3 - derived from server link-local (MAC) address */
  uip_ip6addr(&server_ipaddr, UIP_DS6_DEFAULT_PREFIX, 0, 0, 0, 0x0250, 0xc2ff, 0xfea8, 0xcd1a); //redbee-econotag
#endif
}
/*---------------------------------------------------------------------------*/
PROCESS_THREAD(udp_client_process, ev, data)
{
  static struct etimer periodic;
  static struct etimer stats;
  static struct ctimer backoff_timer;
  static struct ctimer bktimer;
  static int activ=0;
  //static uint16_t  sht21_present;
#if WITH_COMPOWER
  static int print = 0;
#endif

  PROCESS_BEGIN();
  SENSORS_ACTIVATE(relay);
  SENSORS_ACTIVATE(adxl345);
  PROCESS_PAUSE();
  SENSORS_ACTIVATE(button_sensor);
  SENSORS_ACTIVATE(jc10f);
  //SENSORS_ACTIVATE(cc2538_temp_sensor);
  
  //sht21_present = SENSORS_ACTIVATE(sht21);
  jc10f.configure(SENSORS_ACTIVE, ADC1_PIN);
  relay.configure(SENSORS_ACTIVE, 1);
  accm_init();
  set_global_address();

  PRINTF("SENSORCOLLECT process started nbr:%d routes:%d\n",
         NBR_TABLE_CONF_MAX_NEIGHBORS, UIP_CONF_MAX_ROUTES);

  print_local_addresses();

  /* new connection with remote host */
  client_conn = udp_new(NULL, UIP_HTONS(UDP_SERVER_PORT), NULL);
  if(client_conn == NULL) {
    PRINTF("No UDP connection available, exiting the process!\n");
    PROCESS_EXIT();
  }
  udp_bind(client_conn, UIP_HTONS(UDP_CLIENT_PORT));

  PRINTF("Created a connection with the server ");
  PRINT6ADDR(&client_conn->ripaddr);
  PRINTF(" local/remote port %u/%u\n",
	UIP_HTONS(client_conn->lport), UIP_HTONS(client_conn->rport));

  /* initialize serial line */
  uart1_set_input(serial_line_input_byte);
  serial_line_init();
   orchestra_init();

#if WITH_COMPOWER
  powertrace_sniff(POWERTRACE_ON);
#endif

  etimer_set(&periodic, SEND_INTERVAL);
  etimer_set(&stats, SEND_Q_INTERVAL);

  while(1) {
    PROCESS_YIELD();

    if (ev == sensors_event && data == &button_sensor && button_sensor.value(0)) {
       relay.value(RELAY_TOGGLE);
      //  uip_icmp6_send(const uip_ipaddr_t *dest, int type, int code, int payload_len); //mandar ping al sink para ver conectividad
	  //q_test(activ);
       // if(activ==0){activ=1;}else{activ=0;}

    }

    if(ev == tcpip_event) {
      PRINTF("\n\nRX EXTERNAL COMMAND\n\n");
      //relay.value(RELAY_TOGGLE);
      tcpip_handler();
    }

    if(etimer_expired(&stats)) {
        etimer_reset(&stats);
        q_test(activ);
        ctimer_set(&bktimer, SEND_Q_INTERVAL, send_quality, NULL);
    }
     if(etimer_expired(&periodic)) {
        etimer_reset(&periodic);
        ctimer_set(&backoff_timer, SEND_TIME, send_packet, NULL);
    }
  }

  PROCESS_END();
}

