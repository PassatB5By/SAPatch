namespace SAPatcher.Guard;

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
(function() {
    try {
        console.log('[SAPatcher] Open Source Integration active.');
    } catch(e) {}
})();
// === SAPATCHER INTEGRATION END ===";
    }
}
