package main

import (
	"context"
	"log"
	"math/big"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/spf13/viper"
)

type Config struct {
	ContractAddress string `mapstructure:"contract_address"`
	RpcURL          string `mapstructure:"rpc_url"`
	StartBlock      int64  `mapstructure:"start_block"`
	PGDSN           string `mapstructure:"pg_dsn"`
	Step            int64  `mapstructure:"step"`
}

func main() {
	conf := loadConfig()

	db := initDB(conf.PGDSN)

	ethclient := initEthClient(conf.RpcURL)

	// fetch raw logs from ethereum
	logsch := make(chan types.Log)
	go fetchLogs(ethclient, conf.ContractAddress, conf.StartBlock, conf.Step, logsch)

	// process logs and save to db
	go processLogs(db, logsch)

}

func loadConfig() Config {
	// load config from toml file
	viper.SetConfigName("config")
	viper.SetConfigType("toml")
	viper.AddConfigPath(".")

	err := viper.ReadInConfig()
	if err != nil {
		panic(err)
	}

	var conf Config
	err = viper.Unmarshal(&conf)
	if err != nil {
		panic(err)
	}

	return conf
}

func initDB(dsn string) *pgxpool.Pool {
	dbpool, err := pgxpool.New(context.Background(), dsn)
	if err != nil {
		panic(err)
	}

	return dbpool
}

func initEthClient(rpcURL string) *ethclient.Client {
	ethclient, err := ethclient.Dial(rpcURL)
	if err != nil {
		panic(err)
	}

	return ethclient
}

// fetchLogs fetch logs from ethereum and pass to logs channel
// step is the number of blocks to fetch at a time
func fetchLogs(ethclient *ethclient.Client, contractAddress string, startBlock, step int64, logsch chan types.Log) {
	for {
		// Fetch logs in batches of `step` blocks
		endBlock := startBlock + step
		logsSlice, err := ethclient.FilterLogs(
			context.Background(),
			ethereum.FilterQuery{
				FromBlock: big.NewInt(startBlock),
				ToBlock:   big.NewInt(endBlock),
				Addresses: []common.Address{common.HexToAddress(contractAddress)},
			})
		if err != nil {
			log.Fatalf("Error fetching logs from block %d to %d: %s", startBlock, endBlock, err)
		}

		// If no logs are found, move on to the next batch
		if len(logsSlice) == 0 {
			startBlock = endBlock + 1
			continue
		}

		for _, log := range logsSlice {
			logsch <- log
		}
		startBlock = endBlock + 1
	}
}

// processLogs parse logs and pass to event channel
// log will be parsed to related event struct
func processLogs(db *pgxpool.Pool, logsch chan types.Log) {
	for l := range logsch {
		p := EventProcessors[l.Topics[0]]
		if p == nil {
			log.Printf("No processor found for event with topic %s", l.Topics[0].Hex())
			continue
		}

		err := p.ProcessEvent(db, l)
		if err != nil {
			log.Printf("Error parsing event: %s", err)
			continue
		}
	}
}
