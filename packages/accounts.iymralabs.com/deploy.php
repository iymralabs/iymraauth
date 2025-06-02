<?php
$output = shell_exec('cd /home/username/public_html/iymra-accounts && git pull 2>&1');
echo "<pre>$output</pre>";

$output = shell_exec('cd /home/username/public_html/iymra-accounts && npm install 2>&1');
echo "<pre>$output</pre>";

$output = shell_exec('cd /home/username/public_html/iymra-accounts && npm run build 2>&1');
echo "<pre>$output</pre>";

// Restart PM2 process
$output = shell_exec('pm2 restart iymra-accounts 2>&1');
echo "<pre>$output</pre>";
?>