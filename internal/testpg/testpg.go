package testpg

import (
	"fmt"
	"net/url"
	"os"
	"regexp"
	"strings"
	"testing"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var invalidSchemaCharPattern = regexp.MustCompile(`[^a-z0-9_]+`)

func BaseDSNFromEnv() (string, error) {
	for _, key := range []string{"TEST_POSTGRES_DSN", "SQL_DSN"} {
		if value := strings.TrimSpace(os.Getenv(key)); value != "" {
			return value, nil
		}
	}
	return "", fmt.Errorf("set TEST_POSTGRES_DSN or SQL_DSN to run PostgreSQL-backed tests")
}

func BaseDSN(tb testing.TB) string {
	tb.Helper()
	dsn, err := BaseDSNFromEnv()
	if err != nil {
		tb.Skip(err.Error())
	}
	return dsn
}

func sanitizeSchemaName(name string) string {
	name = strings.ToLower(name)
	name = invalidSchemaCharPattern.ReplaceAllString(name, "_")
	name = strings.Trim(name, "_")
	if name == "" {
		name = "test"
	}
	if len(name) > 40 {
		name = name[:40]
	}
	return fmt.Sprintf("test_%s_%d", name, time.Now().UnixNano())
}

func withSearchPath(baseDSN string, schema string) string {
	if strings.HasPrefix(baseDSN, "postgres://") || strings.HasPrefix(baseDSN, "postgresql://") {
		parsed, err := url.Parse(baseDSN)
		if err == nil {
			query := parsed.Query()
			query.Set("search_path", schema)
			parsed.RawQuery = query.Encode()
			return parsed.String()
		}
	}
	return strings.TrimSpace(baseDSN) + " search_path=" + schema
}

func CreateIsolatedDSN(baseDSN string, name string) (string, func() error, error) {
	adminDB, err := gorm.Open(postgres.Open(baseDSN), &gorm.Config{})
	if err != nil {
		return "", nil, err
	}

	schema := sanitizeSchemaName(name)
	if err := adminDB.Exec(`CREATE SCHEMA "` + schema + `"`).Error; err != nil {
		sqlDB, closeErr := adminDB.DB()
		if closeErr == nil {
			_ = sqlDB.Close()
		}
		return "", nil, err
	}

	cleanup := func() error {
		err := adminDB.Exec(`DROP SCHEMA IF EXISTS "` + schema + `" CASCADE`).Error
		sqlDB, closeErr := adminDB.DB()
		if closeErr == nil {
			_ = sqlDB.Close()
		}
		if err != nil {
			return err
		}
		return closeErr
	}

	return withSearchPath(baseDSN, schema), cleanup, nil
}

func NewIsolatedDSN(tb testing.TB) string {
	tb.Helper()
	dsn, cleanup, err := CreateIsolatedDSN(BaseDSN(tb), tb.Name())
	if err != nil {
		tb.Fatalf("failed to create isolated postgres schema: %v", err)
	}
	tb.Cleanup(func() {
		if err := cleanup(); err != nil {
			tb.Fatalf("failed to cleanup isolated postgres schema: %v", err)
		}
	})
	return dsn
}

func OpenIsolatedDB(tb testing.TB) *gorm.DB {
	tb.Helper()
	dsn := NewIsolatedDSN(tb)
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		tb.Fatalf("failed to open isolated postgres db: %v", err)
	}
	tb.Cleanup(func() {
		sqlDB, err := db.DB()
		if err == nil {
			_ = sqlDB.Close()
		}
	})
	return db
}
