Add-Type -AssemblyName System.Drawing

$inputFile = "C:\Users\HP\.gemini\antigravity\brain\379c59c2-84ff-4a97-a8ed-791e60c8f282\media__1780331935715.jpg"
$outputFile = "c:\Users\HP\Downloads\export website\assets\logo.png"

if (-not (Test-Path $inputFile)) {
    Write-Host "Error: Input file not found at $inputFile"
    exit
}

Write-Host "Loading raw logo..."
$img = [System.Drawing.Image]::FromFile($inputFile)
$width = $img.Width
$height = $img.Height

$bmp = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($bmp)
$graphics.DrawImage($img, 0, 0, $width, $height)

Write-Host "Converting white background to transparency..."
# We will check each pixel. Off-white/white background is typically R, G, B > 230
for ($x = 0; $x -lt $width; $x++) {
    for ($y = 0; $y -lt $height; $y++) {
        $pixel = $bmp.GetPixel($x, $y)
        
        # If the pixel is white/off-white (high R, G, B values and low saturation)
        $diffRG = [Math]::Abs($pixel.R - $pixel.G)
        $diffGB = [Math]::Abs($pixel.G - $pixel.B)
        $diffRB = [Math]::Abs($pixel.R - $pixel.B)
        
        if ($pixel.R -gt 220 -and $pixel.G -gt 220 -and $pixel.B -gt 220 -and $diffRG -lt 15 -and $diffGB -lt 15 -and $diffRB -lt 15) {
            $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        }
    }
}

Write-Host "Scanning for content bounding box..."
$minX = $width
$maxX = 0
$minY = $height
$maxY = 0

for ($x = 0; $x -lt $width; $x++) {
    for ($y = 0; $y -lt $height; $y++) {
        $pixel = $bmp.GetPixel($x, $y)
        if ($pixel.A -gt 10) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

$croppedWidth = $maxX - $minX + 1
$croppedHeight = $maxY - $minY + 1

if ($croppedWidth -gt 0 -and $croppedHeight -gt 0) {
    Write-Host "Cropping image to $($croppedWidth)x$($croppedHeight) (Bounds: X: $minX to $maxX, Y: $minY to $maxY)..."
    
    $croppedBmp = New-Object System.Drawing.Bitmap($croppedWidth, $croppedHeight, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $croppedGraphics = [System.Drawing.Graphics]::FromImage($croppedBmp)
    
    $srcRect = New-Object System.Drawing.Rectangle($minX, $minY, $croppedWidth, $croppedHeight)
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $croppedWidth, $croppedHeight)
    
    $croppedGraphics.DrawImage($bmp, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    
    # Save the file
    if (Test-Path $outputFile) {
        Remove-Item $outputFile -Force
    }
    
    $croppedBmp.Save($outputFile, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Host "Saved transparent, cropped logo to $outputFile"
    
    $croppedBmp.Dispose()
    $croppedGraphics.Dispose()
} else {
    Write-Host "Error: No visible pixels found after transparency filter!"
}

# Clean up
$img.Dispose()
$bmp.Dispose()
$graphics.Dispose()
Write-Host "Process completed."
