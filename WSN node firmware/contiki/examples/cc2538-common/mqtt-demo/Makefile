DEFINES+=PROJECT_CONF_H=\"project-conf.h\"

all: mqtt-demo
MODULES += core/net/mac/tsch
CONTIKI_WITH_IPV6 = 1
CFLAGS += -DUIP_CONF_TCP=1


APPS += mqtt orchestra


CONTIKI = ../../..
include $(CONTIKI)/Makefile.include
