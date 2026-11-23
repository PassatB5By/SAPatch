namespace SAPatcher.Guard;

public interface IGuardProvider
{
    string ProviderName { get; }
    string Version { get; }
    bool IsProprietary { get; }
    string GuardHeader { get; }
    string GuardFooter { get; }
    string GetGuardScript();

    bool IsDeveloperModeActive { get; }
    bool CheckHardwareAllowed();
    bool AuthenticateDeveloper(string password);
    void SetDeveloperMode(bool enabled);
    string GetHardwareSummary();
}

