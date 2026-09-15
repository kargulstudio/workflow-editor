#!/bin/bash

# Script to extract first frame from all WebM videos
# Requires FFmpeg to be installed

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if FFmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo -e "${RED}Error: FFmpeg is not installed. Please install FFmpeg first.${NC}"
    echo "You can install it using:"
    echo "  - macOS: brew install ffmpeg"
    echo "  - Ubuntu/Debian: sudo apt install ffmpeg"
    echo "  - Windows: Download from https://ffmpeg.org/download.html"
    exit 1
fi

echo -e "${YELLOW}Starting WebM frame extraction (recursive)...${NC}"
echo "Scanning: public/"
echo ""

# Function to extract first frame from a WebM file
# Output is placed next to the source: video.webm -> video-frame.png
extract_frame() {
    local input_file="$1"
    local dir=$(dirname "$input_file")
    local filename=$(basename "$input_file" .webm)
    local output_file="${dir}/${filename}-frame.png"
    
    echo -e "Processing: ${YELLOW}$input_file${NC}"
    
    # Extract first frame as PNG
    if ffmpeg -i "$input_file" -vframes 1 -f image2 "$output_file" -y 2>/dev/null; then
        echo -e "  ✓ Created: ${GREEN}$output_file${NC}"
        return 0
    else
        echo -e "  ✗ Failed: ${RED}$input_file${NC}"
        return 1
    fi
}

# Counter for success/failure
success_count=0
total_count=0

# Recursively find and process all WebM files in public/
while IFS= read -r -d '' file; do
    total_count=$((total_count + 1))
    if extract_frame "$file"; then
        success_count=$((success_count + 1))
    fi
done < <(find public -type f -name "*.webm" -print0)

# Summary
echo ""
echo "=========================================="
echo -e "${YELLOW}Extraction Summary:${NC}"
echo "Total files processed: $total_count"
echo -e "Successful extractions: ${GREEN}$success_count${NC}"
echo -e "Failed extractions: ${RED}$((total_count - success_count))${NC}"

if [ $success_count -eq $total_count ] && [ $total_count -gt 0 ]; then
    echo -e "${GREEN}All frames extracted successfully!${NC}"
elif [ $success_count -gt 0 ]; then
    echo -e "${YELLOW}Some frames extracted successfully.${NC}"
else
    echo -e "${RED}No frames were extracted.${NC}"
    exit 1
fi

# Step 2: Convert -frame.png files to AVIF and delete originals
echo ""
echo -e "${YELLOW}Converting -frame.png files to AVIF...${NC}"
node scripts/convert-frames-avif.mjs
