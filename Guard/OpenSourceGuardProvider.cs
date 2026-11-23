namespace SAPatcher.Guard;

public class OpenSourceGuardProvider : IGuardProvider
{
    public string ProviderName => "SAPatcher Open Source Core";
    public string Version => "1.0.0";
    public bool IsProprietary => false;

    public string GuardHeader => "// === SAPATCHER INTEGRATION START ===";
    public string GuardFooter => "// === SAPATCHER INTEGRATION END ===";

    public bool IsDeveloperModeActive => false;
    public bool CheckHardwareAllowed() => false;
    public bool AuthenticateDeveloper(string password) => false;
    public void SetDeveloperMode(bool enabled) { }
    public string GetHardwareSummary()
    {
        try
        {
            using var key = Microsoft.Win32.Registry.LocalMachine.OpenSubKey(@"HARDWARE\DESCRIPTION\System\BIOS");
            if (key != null)
            {
                string prod = key.GetValue("BaseBoardProduct")?.ToString() ?? "";
                string mfg = key.GetValue("BaseBoardManufacturer")?.ToString() ?? "";
                if (!string.IsNullOrWhiteSpace(prod))
                {
                    return $"{mfg} {prod}".Trim();
                }
            }
        }
        catch {}
        return "Generic Hardware";
    }

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

