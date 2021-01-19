<?php
$dom = new DOMDocument();
libxml_use_internal_errors(true);
$dom->loadHTMLFile('https://nadc.china-vo.org/astrodict/q?word='.$_GET['query']);

$script = $dom->getElementsByTagName('script');

$remove = [];
foreach($script as $item)
{
  $remove[] = $item;
}

foreach ($remove as $item)
{
  $item->parentNode->removeChild($item); 
}

$data = $dom->getElementById("resulttbl");
if($data){
	echo $dom->saveHTML($data);
}else{
	echo "<strong>无结果 NO RESULT</strong>";
}
?>