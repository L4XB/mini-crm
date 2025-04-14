FROM golang:1.18-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git

# Copy go.mod and go.sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the Go app
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main ./cmd/main.go

# Start a new stage from scratch
FROM alpine:latest

RUN apk --no-cache add ca-certificates tzdata

WORKDIR /root/

# Copy the pre-built binary from the previous stage
COPY --from=builder /app/main .
# Copy any other necessary files like .env.example
COPY --from=builder /app/.env.example .

# Expose the application port
EXPOSE 8081

# Command to run the executable
CMD ["./main"]
