all: broadcast-example unicast-sender unicast-receiver
APPS=servreg-hack

CONTIKI=../../..
SMALL=1
CFLAGS += -DPROJECT_CONF_H=\"project-conf.h\"
MODULES += core/net/mac/tsch
CONTIKI_WITH_IPV6 = 1
CFLAGS += -DUIP_CONF_ND6_SEND_NS=1
include $(CONTIKI)/Makefile.include
