<?php 

include_once('../conexao.php');

$postjson = json_decode(file_get_contents('php://input'), true);

$query = $pdo->query("SELECT * from clientes where ativo = 'Sim'");
$res = $query->fetchAll(PDO::FETCH_ASSOC);
$total_pessoas = @count($res);


$query = $pdo->query("SELECT * from contas_receber where vencimento = curDate()");
$res = $query->fetchAll(PDO::FETCH_ASSOC);
$contasaReceber = @count($res);

$query = $pdo->query("SELECT * from contas_receber where vencimento = curDate() and status = 'Paga'");
$res = $query->fetchAll(PDO::FETCH_ASSOC);
$contasRecebidas = @count($res);

$query = $pdo->query("SELECT * from contas_receber where vencimento = curDate() and status = 'Pendente'");
$res = $query->fetchAll(PDO::FETCH_ASSOC);
$contasaReceberPendentes = @count($res);

$query = $pdo->query("SELECT * from contas_pagar where vencimento = curDate() and status = 'Pendente'");
$res = $query->fetchAll(PDO::FETCH_ASSOC);
$contasaPagarHoje = @count($res);

$result = json_encode(array('success'=>true, 
    'quantidade_clientes'=>$total_pessoas,
    'contasRecebidas'=>$contasRecebidas,
    'contasaReceber'=>$contasaReceber,
    'contasaPagarHoje'=>$contasaPagarHoje,
    'contasaReceberPendentes'=>$contasaReceberPendentes,
    
));

echo $result;
