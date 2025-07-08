#!/bin/bash

# Site Theater Test Runner Script
# This script allows you to run tests from the root directory

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}🎭 Site Theater Test Runner${NC}"
    echo -e "${PURPLE}================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Print header
print_status

# Check if we're in the right directory
if [ ! -d "playwright-tests" ]; then
    print_error "playwright-tests directory not found!"
    echo "Please run this script from the test-runner directory"
    exit 1
fi

# Change to playwright-tests directory
cd playwright-tests

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    print_warning "Dependencies not found. Installing..."
    npm install
    print_success "Dependencies installed"
fi

# Check if browsers are installed
if [ ! -d "node_modules/@playwright" ]; then
    print_warning "Playwright browsers not found. Installing..."
    npx playwright install
    print_success "Playwright browsers installed"
fi

# Parse command line arguments
BROWSERS="chromium webkit"
GREP_PATTERN=""
UI_MODE=false
SHOW_REPORT=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --browsers)
            BROWSERS="$2"
            shift 2
            ;;
        --grep)
            GREP_PATTERN="$2"
            shift 2
            ;;
        --ui)
            UI_MODE=true
            shift
            ;;
        --report)
            SHOW_REPORT=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --browsers BROWSERS    Specify browsers (default: chromium webkit)"
            echo "  --grep PATTERN        Run tests matching pattern (e.g., STT-01)"
            echo "  --ui                  Run tests in UI mode"
            echo "  --report              Show test report after execution"
            echo "  --help                Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                           # Run all tests on both browsers"
            echo "  $0 --browsers chromium       # Run tests only on Chrome"
            echo "  $0 --grep STT-02            # Run only health check tests"
            echo "  $0 --ui                     # Run tests in interactive UI mode"
            echo "  $0 --report                 # Run tests and show report"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Build the command
CMD="npx playwright test"

# Add browser projects
for browser in $BROWSERS; do
    CMD="$CMD --project=$browser"
done

# Add grep pattern if specified
if [ ! -z "$GREP_PATTERN" ]; then
    CMD="$CMD --grep \"$GREP_PATTERN\""
fi

# Add UI mode if specified
if [ "$UI_MODE" = true ]; then
    CMD="$CMD --ui"
fi

# Print what we're about to run
echo ""
print_success "Running Site Theater tests..."
echo -e "${BLUE}Command: $CMD${NC}"
echo -e "${BLUE}Browsers: $BROWSERS${NC}"
if [ ! -z "$GREP_PATTERN" ]; then
    echo -e "${BLUE}Pattern: $GREP_PATTERN${NC}"
fi
echo ""

# Execute the command
eval $CMD
TEST_EXIT_CODE=$?

# Show report if requested and tests completed
if [ "$SHOW_REPORT" = true ] && [ $TEST_EXIT_CODE -eq 0 ]; then
    echo ""
    print_success "Opening test report..."
    npx playwright show-report
fi

# Print final status
echo ""
if [ $TEST_EXIT_CODE -eq 0 ]; then
    print_success "All tests completed successfully! 🎉"
else
    print_error "Some tests failed. Check the output above for details."
fi

exit $TEST_EXIT_CODE
