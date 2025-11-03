<?php
$path = 'videos/' . basename($_GET['file']);

if (!file_exists($path)) {
    header("HTTP/1.1 404 Not Found");
    exit;
}

$size = filesize($path);
$length = $size;
$start = 0;
$end = $size - 1;

if (isset($_SERVER['HTTP_RANGE'])) {
    $range = $_SERVER['HTTP_RANGE'];
    list(, $range) = explode('=', $range, 2);
    if (strpos($range, ',') !== false) {
        header('HTTP/1.1 416 Requested Range Not Satisfiable');
        exit;
    }

    if ($range == '-') {
        $start = $size - substr($range, 1);
    } else {
        $range = explode('-', $range);
        $start = intval($range[0]);
        $end = isset($range[1]) && is_numeric($range[1]) ? intval($range[1]) : $end;
    }

    $end = min($end, $size - 1);
    $length = $end - $start + 1;

    header('HTTP/1.1 206 Partial Content');
    header("Content-Range: bytes $start-$end/$size");
}

header("Content-Type: video/mp4");
header("Content-Length: $length");
header("Accept-Ranges: bytes");

$fp = fopen($path, 'rb');
fseek($fp, $start);

$buffer = 1024 * 8;
while (!feof($fp) && ($pos = ftell($fp)) <= $end) {
    if ($pos + $buffer > $end) {
        $buffer = $end - $pos + 1;
    }
    echo fread($fp, $buffer);
    flush();
}
fclose($fp);
?>

