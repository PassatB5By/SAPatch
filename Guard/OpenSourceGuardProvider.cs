namespace SAPatcher.Guard;

/// <summary>
/// Стандартная открытая реализация интеграции лаунчера.
/// Не содержит закрытых античит-алгоритмов и сигнатур.
/// </summary>
public class OpenSourceGuardProvider : IGuardProvider
{
    public string ProviderName => "SAPatcher Open Source Core";
    public string Version => "1.0.0";
    public bool IsProprietary => false;

    public string GuardHeader => "// === SAPATCHER INTEGRATION START ===";
    public string GuardFooter => "// === SAPATCHER INTEGRATION END ===";

    public string GetGuardScript()
    {
        return
@"// === SAPATCHER INTEGRATION START ===
// SAPatcher Open Source Runtime Integration
// Proprietary anti-cheat module is excluded in this build.
(function() {
    try {
        console.log('[SAPatcher] Open Source Integration active.');
    } catch(e) {}
})();
// === SAPATCHER INTEGRATION END ===";
    }
}
